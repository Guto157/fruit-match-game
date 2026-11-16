# Fruit Match

Protótipo inicial do jogo de combinar frutas, organizado em duas telas independentes e sem rolagem.

## Telas
- **Tela inicial:** perfil, moedas, diamantes, mapa e seleção de fases, além dos acessos a amigos, ranking, loja, upgrades e vídeos.
- **Tela de jogo:** abre somente ao tocar em **JOGAR**. Exibe fase, tempo, moedas, pontuação, reserva de cinco espaços, tabuleiro e recursos da partida.

## Mecânica atual
- Toque nas frutas para enviá-las à reserva.
- Três frutas iguais são removidas automaticamente.
- A reserva comporta cinco frutas. Se lotar, a partida termina.
- Recursos disponíveis no protótipo: desfazer, embaralhar e dica.
- A vitória concede moedas e libera a próxima fase demonstrativa.

## Arquivos
- `index.html`: estrutura das duas telas.
- `css/style.css`: visual responsivo em tela cheia, sem rolagem.
- `js/app.js`: navegação, mapa e seleção de fase.
- `js/game.js`: mecânica, cronômetro, pontuação e recursos.

## Testar
Abra `index.html` em um navegador ou publique o repositório com GitHub Pages.

Cadastro, amigos, rankings online, loja real, anúncios AdMob, sincronização e progressão completa serão integrados em etapas posteriores.