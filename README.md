SearchAllTabContent
===================

#### これはなに？
全てのタブの内容について検索するvimperator向けコードです．  
vimの`:vimgrep`的なファイル横断検索を真似て，  
vimperatorでタブ横断検索します．モドキもいいところですが...  
![Alt text](http://i.gyazo.com/b3bbe064a8b189bacaf797aaccc6a1b1.png)


#### 使い方
main.jsの内容を_vimperatorrcに貼り付けると，  
`:SearchAllTabContent`コマンドが使えるようになります．  
使い方は，`:SearchAllTabContent [検索ワード1]..[検索ワードN]`です．

例えば，上画像のように，コマンドラインに  
`:SearchAllTabContent vimperator completer`と入力すると，  
全てのタブについて，その本文に*vimperator*と*completer*が共に含まれるタブのみを  
マッチした文字列近傍として補完リストに表示します．

そして，*Tabキー*で補完リストから選択し，*Enterキー*を押下すると，  
その対象のタブに移動し，マッチした文字列について検索します．  
（現状は，マッチした位置の文字列に遷移できません．）

#### 補足
キーバインドする場合は，*_vimperatorrc*ファイルに  
例えば`nnoremap O :SearchAllTabContent<Space>`と記述すると*Shift+oキー*にバインドできます．
