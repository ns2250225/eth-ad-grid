from django.shortcuts import render
from rest_framework import viewsets
from .models import *
from .serializers import *
# Create your views here.

class AdViewSet(viewsets.ModelViewSet):
    """
    上架资产接口
    """
    queryset = AdImage.objects.all()
    serializer_class = AdSerializer
