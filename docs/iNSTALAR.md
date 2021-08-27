# Instalar dependências
Essas são as dependências do bot:
```
google-chrome
xvfb
pulseaudio
xdotool
openbox
node
```

Para depuração, essas dependências são necessárias:
```
x11vnc
realvnc-viewer (proprietário)
```

Após instalar esses pacotes, é necessário configurar o bot em si.

# Configurar
Primeiro, é preciso informar as configurações do bot. Para isso, copie o arquivo `settings.json.example` e mude o nome da cópia
para `settings.json`. Nesse arquivo, preencha os campos:
```json
{
    "discord_bot_token": "TOKEN DO *BOT* DISCORD AQUI",
    "owner_id": "SEU ID DO DISCORD",
    "xvfb_preferred_display_number": 800
}
```

Após preencher o arquivo, execute o seguinte comando:
```
node configure_bot.js
```
Uma janela do Chrome será aberta, e será solicitado o login da conta que fará o streaming em si. Após o login, o script termina.

# O bot não faz streaming, por quê?
Tenha certeza que o popup da permissão de microfone não esteja atrapalhando o bot. Com o bot ligado, digite:
```
x11vnc --display :800
```
Abra o RealVNC Viewer e aponte para o endereço `localhost:5900`. Se tiver um popup de microfone aberto, negue a permissão.