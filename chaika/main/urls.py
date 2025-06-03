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
    path('get_children_data/', views.get_children_data, name='get_children_data'),
    path('update_child_data/', views.update_child_data, name='update_child_data'),
    path('add_child/', views.add_child, name='add_child'),
    path('delete_child/', views.delete_child, name='delete_child'),
    path('create-request/', views.create_request, name='create_request'),
    path('get-requests/', views.get_user_requests, name='get_requests'),
    path('update-request-status/', views.update_request_status, name='update_request_status'),
    path('filter-requests/', views.filter_requests, name='filter_requests'),
]
