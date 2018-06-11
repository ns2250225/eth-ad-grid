from django.db import models

# Create your models here.
class AdImage(models.Model):
	ad_file = models.FileField(upload_to='uploads/%Y/%m/%d/')