@echo off
title Formulario 70-20-10 - Senac RH
cd /d "%~dp0"
echo Verificando arquivos...
if not exist app.py echo ERRO: app.py nao encontrado! & pause & exit
if not exist index.html echo ERRO: index.html nao encontrado! & pause & exit
if not exist acoes.json echo ERRO: acoes.json nao encontrado! & pause & exit
if not exist colabs.json echo ERRO: colabs.json nao encontrado! & pause & exit
if not exist areas.json echo ERRO: areas.json nao encontrado! & pause & exit
if not exist static\app.js echo ERRO: static\app.js nao encontrado! & pause & exit
echo Todos os arquivos OK!
echo.
echo Servidor iniciando...
echo Link: http://10.2.10.96:5000
echo Para encerrar: feche esta janela.
echo.
py app.py
pause
