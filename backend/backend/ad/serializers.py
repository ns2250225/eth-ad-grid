#coding=utf-8
from rest_framework import serializers
from .models import *

# 证书文件模型序列化
class AdSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdImage
        fields = '__all__'