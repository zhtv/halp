from django.urls import path
from . import views
from django.contrib.auth.views import LogoutView

urlpatterns = [
    path('', views.index, name='index'),
    path('404/', views.error_404, name='404'),
    path('admin-page/', views.admin_page, name='admin'),  # чтобы не пересекалось с Django admin
    path('auth/', views.auth_page, name='auth'),
    path('cabinet/', views.cabinet, name='cabinet'),
    path('contacts/', views.contacts, name='contacts'),
    path('education/', views.education, name='education'),
    path('performances/', views.performances, name='performances'),
    path('registration/', views.registration, name='registration'),
    path('teachers/', views.teachers, name='teachers'),
    path('team/', views.team, name='team'),
    path('logout/', LogoutView.as_view(next_page='index'), name='logout'),
    path('update-profile/', views.update_parent_profile, name='update_profile'),
]
