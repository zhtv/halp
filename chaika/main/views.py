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
from .models import ParentProfile
from django.contrib.auth.hashers import check_password
from django.contrib.auth import update_session_auth_hash

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

@admin_or_redirect
def admin_page(request):
    return render(request, 'main/admin.html')

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

def contacts(request):
    return render(request, 'main/contacts.html')

def education(request):
    return render(request, 'main/education.html')

def performances(request):
    return render(request, 'main/performances.html')

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


def teachers(request):
    return render(request, 'main/teachers.html')

def team(request):
    return render(request, 'main/team.html')