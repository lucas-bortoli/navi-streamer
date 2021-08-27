# Comandos
O prefixo é [`.`].

## ajuda
Mostra a lista de comandos disponíveis
## play | pause
Outros nomes: `p`

Dá play ou pause no streaming atual. Se não houver nada sendo streamado, um erro ocorre.
## seek <+++++++ ou ------>
Outros nomes: `s`

O vídeo é pulado `N` segundos para frente (se `N > 0`) ou para trás (se `N < 0`). A cada `+` dado como parâmetro, 10 segundos são somados a `N`. A cada `-` dado, 10 segundos são subtraídos de `N`. Por exemplo, para voltar 30 segundos no vídeo, é preciso executar: `.seek ---`.

## subtitle
Outros nomes: `sub`, `legenda`

Coloca legendas na stream atual. Ao executar o comando, o bot enviará outra mensagem solicitando um arquivo do tipo `.srt` (arquivo de legendas). Você deverá fazer upload do arquivo no mesmo canal -- o bot baixará ele e aplicará na stream.

## subtitle-offset \<N>
Outros nomes: `suboffset`

Se as legendas não estão sincronizadas com o áudio, é possível ajustar seu delay. Por exemplo, `.subtitle-offset 10` fará com que as legendas apareçam 10 segundos DEPOIS de onde apareceriam novamente. Um número negativo faz elas aparecerem ANTES.

## view-torrent
Mostra os arquivos do torrent, junto com seu progresso de download (%).

## set-torrent <magnet>
Ao executar esse comando, o bot apagará o torrent anterior e baixará o torrent dado pelo link especificado. 

## start \<N>
Inicia o streaming de um arquivo. `N` é dado como o ID do arquivo no comando `.view-torrent`. Para executar esse comando, você deve estar no canal de voz onde o streaming ocorrerá.

## stop
Para a stream.