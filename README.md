# Fruit Match

Protótipo jogável de combinar frutas, com tela inicial e partida em telas independentes.

## Como jogar
- Na tela inicial, selecione uma fase liberada e toque em **JOGAR**.
- Toque nas frutas para enviá-las aos cinco espaços da reserva.
- Ao reunir três frutas iguais, elas desaparecem automaticamente.
- Se a reserva ocupar os cinco espaços, a partida termina.
- Retire todas as frutas para vencer e liberar a próxima fase.

## Recursos
- **Desfazer:** restaura a jogada anterior por 100 moedas.
- **Embaralhar:** reorganiza as frutas restantes por 150 moedas.
- **Dica:** destaca frutas que podem completar um trio por 50 moedas.
- A vitória concede 50 moedas.
- Moedas e fases liberadas ficam salvas no armazenamento local do aparelho/navegador.

## Arquivos
- `index.html`: estrutura das duas telas.
- `css/style.css`: layout responsivo em tela cheia.
- `js/app.js`: navegação, mapa e progresso.
- `js/game.js`: tabuleiro, reserva, cronômetro, pontuação e recursos.

## Limites desta versão
O perfil, amigos, rankings online, loja real, anúncios e sincronização ainda não estão conectados a serviços externos. As cinco fases atuais usam a mecânica básica.

## Testar
Abra `index.html` em um navegador ou publique o repositório com GitHub Pages.

## Queda das frutas
Quando uma fruta é retirada, as frutas que estão acima dela na mesma coluna descem com animação contínua até preencher os espaços vazios. Elas não são removidas e recriadas visualmente.

## Estrelas e recordes
- 3 estrelas: concluir sem erros.
- 2 estrelas: concluir com 1 erro.
- 1 estrela: concluir com 2 ou mais erros.
- Um erro é registrado cada vez que a reserva chega a 4 frutas ocupadas. Se chegar a 5, a partida termina em derrota.
- Ao selecionar uma fase no mapa, o jogo mostra o melhor resultado salvo: estrelas e tempo.
- O recorde prioriza mais estrelas; em caso de empate, fica o menor tempo.
