import re
from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt  # для AJAX запросов
from .forms import RegistrationForm
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.decorators import login_required, user_passes_test
from functools import wraps
from .models import ParentProfile, Child
from django.contrib.auth.hashers import check_password
from django.contrib.auth import update_session_auth_hash
# 
from django.forms.models import model_to_dict
from django.core.exceptions import ValidationError
from datetime import datetime
# 
from .models import Request
from django.utils import timezone

def admin_or_redirect(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        user = request.user
        if not user.is_authenticated:
            return redirect('auth')       # неавторизованные — на авторизацию
        elif not user.is_superuser:
            return redirect('cabinet')    # авторизованные, но не админы — в кабинет
        return view_func(request, *args, **kwargs)  # админы идут дальше
    return _wrapped_view

def index(request):
    return render(request, 'main/index.html')

def error_404(request):
    return render(request, 'main/404.html')

def teachers(request):
    return render(request, 'main/teachers.html')

def team(request):
    return render(request, 'main/team.html')

def contacts(request):
    return render(request, 'main/contacts.html')

def education(request):
    return render(request, 'main/education.html')

def performances(request):
    return render(request, 'main/performances.html')

@admin_or_redirect
def admin_page(request):
    # Получаем количество новых заявок
    new_requests_count = Request.objects.filter(status='new').count()
    
    # Активные заявки (не архивные)
    active_requests = Request.objects.exclude(status__in=['completed', 'rejected']).order_by('-created_at')
    
    # Архивные заявки (выполненные и закрытые)
    archived_requests = Request.objects.filter(status__in=['completed', 'rejected']).order_by('-created_at')
    
    context = {
        'new_requests_count': new_requests_count,
        'requests': active_requests,  # по умолчанию показываем активные
        'archived_requests': archived_requests,  # заявки для вкладки архива
    }
    return render(request, 'main/admin.html', context)

def auth_page(request):
    if request.method == 'POST' and request.META.get('HTTP_X_REQUESTED_WITH') == 'XMLHttpRequest':
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        # Проверка наличия пользователя
        if not User.objects.filter(username=username).exists():
            return JsonResponse({'success': False, 'errors': {'username': [{'message': 'Пользователь с таким логином не найден'}]}})
        
        user = authenticate(request, username=username, password=password)
        if user is None:
            # Неправильный пароль
            return JsonResponse({'success': False, 'errors': {'password': [{'message': 'Неверный пароль'}]}})
        
        login(request, user)
        return JsonResponse({'success': True, 'redirect_url': '/cabinet/'})
    
    return render(request, 'main/auth.html')

@login_required(login_url='auth')
def cabinet(request):
    profile, _ = ParentProfile.objects.get_or_create(user=request.user)
    return render(request, 'main/cabinet.html', {
        'profile': profile,
        'user_email': request.user.email
    })

@csrf_exempt
@login_required(login_url='auth')
def update_parent_profile(request):
    if request.method == 'POST' and request.META.get('HTTP_X_REQUESTED_WITH') == 'XMLHttpRequest':
        full_name = request.POST.get('full_name', '').strip()
        phone_number = request.POST.get('phone_number', '').strip()
        current_password = request.POST.get('current_password', '').strip()
        new_password = request.POST.get('new_password', '').strip()

        user = request.user
        profile = ParentProfile.objects.get(user=user)

        # Обновляем ФИО и телефон, если указаны
        if full_name:
            profile.full_name = full_name
        if phone_number:
            profile.phone_number = phone_number

        # Обработка смены пароля
        if new_password:
            if not current_password:
                return JsonResponse({'success': False, 'error': 'Укажите текущий пароль.'})

            if not user.check_password(current_password):
                return JsonResponse({'success': False, 'error': 'Неверный текущий пароль.'})

            # Проверка нового пароля (длина и хотя бы одна цифра)
            if len(new_password) < 8 or not any(char.isdigit() for char in new_password):
                return JsonResponse({'success': False, 'error': 'Новый пароль должен быть не менее 8 символов и содержать хотя бы одну цифру.'})

            # Обновление пароля
            user.set_password(new_password)
            user.save()
            update_session_auth_hash(request, user)  # сохраняем сессию

        profile.save()
        return JsonResponse({'success': True})

    return JsonResponse({'success': False, 'error': 'Недопустимый запрос'})

def registration(request):
    if request.method == 'POST' and request.META.get('HTTP_X_REQUESTED_WITH') == 'XMLHttpRequest':
        form = RegistrationForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data['email']
            password = form.cleaned_data['password']
            user = User.objects.create_user(username=email, email=email, password=password)
            return JsonResponse({'success': True})
        else:
            errors = {field: error.get_json_data() for field, error in form.errors.items()}
            return JsonResponse({'success': False, 'errors': errors})
    else:
        form = RegistrationForm()
    return render(request, 'main/registration.html', {'form': form})

@csrf_exempt
@login_required(login_url='auth')
def get_children_data(request):
    if request.method == 'GET' and request.META.get('HTTP_X_REQUESTED_WITH') == 'XMLHttpRequest':
        profile = request.user.parentprofile
        children = list(profile.children.all().values('id', 'full_name', 'birth_date', 'phone_number', 'email', 'group_name', 'teacher_info'))
        return JsonResponse({'success': True, 'children': children})
    return JsonResponse({'success': False, 'error': 'Недопустимый запрос'})

@csrf_exempt
@login_required(login_url='auth')
def update_child_data(request):
    if request.method == 'POST' and request.META.get('HTTP_X_REQUESTED_WITH') == 'XMLHttpRequest':
        child_id = request.POST.get('child_id')
        field_name = request.POST.get('field_name')
        field_value = request.POST.get('field_value', '').strip()
        
        try:
            child = Child.objects.get(id=child_id, parent=request.user.parentprofile)
            
            if hasattr(child, field_name):
                if field_name == 'birth_date' and field_value:
                    try:
                        field_value = datetime.strptime(field_value, '%Y-%m-%d').date()
                    except ValueError:
                        return JsonResponse({'success': False, 'error': 'Неверный формат даты'})
                
                setattr(child, field_name, field_value)
                try:
                    child.full_clean()  # Валидация модели
                    child.save()
                    return JsonResponse({'success': True})
                except ValidationError as e:
                    return JsonResponse({'success': False, 'error': str(e)})
            else:
                return JsonResponse({'success': False, 'error': 'Неверное имя поля'})
        except Child.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Ребёнок не найден'})
    
    return JsonResponse({'success': False, 'error': 'Недопустимый запрос'})

@csrf_exempt
@login_required(login_url='auth')
def add_child(request):
    if request.method == 'POST' and request.META.get('HTTP_X_REQUESTED_WITH') == 'XMLHttpRequest':
        profile = request.user.parentprofile
        if profile.children.count() >= 5:
            return JsonResponse({'success': False, 'error': 'Нельзя добавить больше 5 детей'})
        
        child = Child.objects.create(parent=profile)
        return JsonResponse({'success': True, 'child_id': child.id})
    return JsonResponse({'success': False, 'error': 'Недопустимый запрос'})

@csrf_exempt
@login_required(login_url='auth')
def delete_child(request):
    if request.method == 'POST' and request.META.get('HTTP_X_REQUESTED_WITH') == 'XMLHttpRequest':
        child_id = request.POST.get('child_id')
        try:
            child = Child.objects.get(id=child_id, parent=request.user.parentprofile)
            child.delete()
            return JsonResponse({'success': True})
        except Child.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Ребёнок не найден'})
    return JsonResponse({'success': False, 'error': 'Недопустимый запрос'})

@login_required
def create_request(request):
    if request.method == 'POST':
        text = request.POST.get('text', '').strip()
        if text:
            Request.objects.create(
                user=request.user,
                text=text,
                status='new'
            )
            return JsonResponse({'success': True})
        return JsonResponse({'success': False, 'error': 'Текст заявки не может быть пустым'})
    return JsonResponse({'success': False, 'error': 'Неверный метод запроса'})

@login_required
def get_user_requests(request):
    requests = Request.objects.filter(user=request.user).order_by('-created_at')
    requests_data = [{
        'id': req.id,
        'text': req.text,
        'status': req.get_status_display(),
        'created_at': req.created_at.strftime('%d.%m.%Y %H:%M'),
        'admin_comment': req.admin_comment or ''
    } for req in requests]
    return JsonResponse({'requests': requests_data}, safe=False)

@user_passes_test(lambda u: u.is_staff)
def update_request_status(request):
    if request.method == 'POST':
        try:
            request_id = request.POST.get('request_id')
            status = request.POST.get('status')
            comment = request.POST.get('comment', '')
            
            req = Request.objects.get(id=request_id)
            req.status = status
            req.admin_comment = comment
            req.save()
            
            # Всегда возвращаем актуальное количество новых заявок
            new_requests_count = Request.objects.filter(status='new').count()
            
            return JsonResponse({
                'success': True,
                'new_requests_count': new_requests_count,
                'is_archived': status in ['completed', 'rejected']
            })
            
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    return JsonResponse({'success': False, 'error': 'Invalid request method'})

@admin_or_redirect
def filter_requests(request):
    status = request.GET.get('status', 'all')
    is_archive = request.GET.get('archive', 'false') == 'true'
    
    if is_archive:
        requests = Request.objects.filter(status__in=['completed', 'rejected'])
    elif status == 'all':
        requests = Request.objects.all()
    else:
        requests = Request.objects.filter(status=status)
    
    requests = requests.order_by('-created_at')
    
    requests_data = [{
        'id': r.id,
        'created_at': r.created_at.strftime("%d.%m.%Y %H:%M"),
        'user_name': r.user.parentprofile.full_name if hasattr(r.user, 'parentprofile') else "Не указано",
        'user_email': r.user.email,
        'text': r.text,
        'status': r.get_status_display(),
        'admin_comment': r.admin_comment or "-",
        'status_value': r.status
    } for r in requests]
    
    return JsonResponse({
        'requests': requests_data,
        'new_requests_count': Request.objects.filter(status='new').count()
    })