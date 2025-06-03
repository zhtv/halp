from django import forms
from django.contrib.auth.models import User
import re

class RegistrationForm(forms.Form):
    email = forms.EmailField(
        label="Логин (ваш e-mail):",
        widget=forms.EmailInput(attrs={'placeholder': 'teatr-studio99@mail.ru', 'required': True})
    )
    password = forms.CharField(
        label="Пароль:",
        widget=forms.PasswordInput(attrs={'placeholder': 'Пароль', 'required': True}),
        min_length=8
    )
    password2 = forms.CharField(
        label="Повторите пароль:",
        widget=forms.PasswordInput(attrs={'placeholder': 'Пароль ещё раз', 'required': True})
    )

    def clean_email(self):
        email = self.cleaned_data['email']
        if User.objects.filter(username=email).exists():
            raise forms.ValidationError("Пользователь с таким email уже зарегистрирован")
        return email

    def clean_password(self):
        password = self.cleaned_data['password']
        # Проверка пароля: минимум 8 символов, хотя бы одна цифра, латинские буквы, цифры и спецсимволы
        if not re.match(r'^[A-Za-z0-9@#$%^&+=!_?\-.*]*$', password):
            raise forms.ValidationError("Пароль может содержать только латинские буквы, цифры и специальные символы")
        if not re.search(r'\d', password):
            raise forms.ValidationError("Пароль должен содержать хотя бы одну цифру")
        return password

    def clean(self):
        cleaned_data = super().clean()
        p1 = cleaned_data.get('password')
        p2 = cleaned_data.get('password2')
        if p1 and p2 and p1 != p2:
            self.add_error('password2', "Пароли не совпадают")
