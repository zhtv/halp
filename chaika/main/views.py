from django.shortcuts import render

def index(request):
    return render(request, 'main/index.html')

def error_404(request):
    return render(request, 'main/404.html')

def admin_page(request):
    return render(request, 'main/admin.html')

def auth_page(request):
    return render(request, 'main/auth.html')

def cabinet(request):
    return render(request, 'main/cabinet.html')

def contacts(request):
    return render(request, 'main/contacts.html')

def education(request):
    return render(request, 'main/education.html')

def performances(request):
    return render(request, 'main/performances.html')

def registration(request):
    return render(request, 'main/registration.html')

def teachers(request):
    return render(request, 'main/teachers.html')

def team(request):
    return render(request, 'main/team.html')