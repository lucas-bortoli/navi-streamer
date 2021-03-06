import ICommand from "../types/ICommand";
import { Message, MessageEmbed } from "discord.js"

export default class implements ICommand {
    public name = 'ajuda'
    public aliases = [ '?', 'help' ]
    public ownerOnly = false
    
    public async exec(msg: Message, args: string[]): Promise<void> {
        const embed = new MessageEmbed()

        embed.setDescription(`**play | pause**
Outros nomes: \`p\`

Dá play ou pause no streaming atual. Se não houver nada sendo streamado, um erro ocorre.

**seek <+++++++ ou ------>**
Outros nomes: \`s\`

O vídeo é pulado \`N\` segundos para frente (se \`N > 0\`) ou para trás (se \`N < 0\`). A cada `+` dado como parâmetro, 10 segundos são somados a \`N\`. A cada \`-\` dado, 10 segundos são subtraídos de \`N\`. Por exemplo, para voltar 30 segundos no vídeo, é preciso executar: \`.seek ---\`.

**subtitle**
Outros nomes: \`sub\`, \`legenda\`

Coloca legendas na stream atual. Ao executar o comando, o bot enviará outra mensagem solicitando um arquivo do tipo \`.srt\` (arquivo de legendas). Você deverá fazer upload do arquivo no mesmo canal -- o bot baixará ele e aplicará na stream.

**subtitle-offset \<N>**
Outros nomes: \`suboffset, o\`

Se as legendas não estão sincronizadas com o áudio, é possível ajustar seu delay. Por exemplo, \`.subtitle-offset 10\` fará com que as legendas apareçam 10 segundos DEPOIS de onde apareceriam novamente. Um número negativo faz elas aparecerem ANTES.

**qualidade \<R>**
Outros nomes: \`resolução, res, q\`

Muda a qualidade do vídeo. \`R\` pode ser 144p, 240p, 360p, 480p e 720p. Esse comando permite reduzir a latência, a custo da qualidade de vídeo.

**view-torrent**
Mostra os arquivos do torrent, junto com seu progresso de download (%).

**set-torrent <magnet>**
Ao executar esse comando, o bot apagará o torrent anterior e baixará o torrent dado pelo link especificado. 

**start \<N>**
Inicia o streaming de um arquivo. \`N\` é dado como o ID do arquivo no comando \`.view-torrent\`. Para executar esse comando, você deve estar no canal de voz onde o streaming ocorrerá.

**stop**
Para a stream.`)

        embed.addField('\u200b', '\u200b')
        embed.addField('Fiz `.start` e não funcionou', `Certas vezes, o comando dá erro por motivos técnicos (o código não é muito bonito, para começar). Re-executar o comando deve arrumar o problema, mas se não arrumar... me chama no DM.`)
        embed.addField('Quais os formatos de arquivo suportados?', `Os codecs que tenho certeza que funcionam são: \`H.264 (alguns mp4s), AV1, VP8, VP9, WebM e MKV\`. Esses são os formatos suportados pelo Google Chrome -- não posso fazer muito a respeito.`)

        embed.setFooter(new Date().toLocaleString())
        msg.channel.send('Ajuda enviada no DM.')
        msg.author.send({ embeds: [embed] })
    }
}