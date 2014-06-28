SearchAllTabContent
===================

全てのタブの内容について検索するvimperator向けコード
![Alt text](http://i.gyazo.com/b3bbe064a8b189bacaf797aaccc6a1b1.png)

main.jsの内容を_vimperatorrcに貼り付けると，  
`:SearchAllTabContent`コマンドが使えるようになります．

キーバインドする場合は，例えば*_vimperatorrc*ファイルに  
`nnoremap O :SearchAllTabContent<Space>`と記述すると*Shift+o*にバインドできます．
