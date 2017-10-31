Die Cordova / Phonegap Datei 'config.xml' ist für cordova anders als für phonegap. Ein Synchronisieren zwischen verschiedenen PLattformen ist daher nicht möglich.


Falls beim Updaten mit GIT oder SVN eine der Versionen doch überschrieben wird, bietet es sich an, für jede Version noch einmal extra ein Backup zu kopieren mit aussagekräftigem Namen, zB. config-{cordova,phonegap}.xml.


[ SVN ]

SVN-Manager ist generell Eclipse 'subclipse' plugin

Tortoise unter Windows ist ok aber anscheinend nicht 100% kompatibel. Tortoise wird als Menü-Ergänzung in den Windows Filemanager eingebunden, bzw. in jeden kompatiblen Filemanager. Ich verwende derzeit den dual-pane AB-Commander den ich generell empfehlen kann.

Ordner dito-m-anliegen -> trunk = root

Aktivierte Ordner: 
www
hooks

(optional also folder 'Archiv')

Aktivierte Dateien:

config.xml 							# Achtung, das ist die Version des jeweiligen OS, also cordova oder phonegap)

config-{cordova,phonegap}.xml		# Backup

package-{cordova,phonegap}.json  (just for reference, since this file is always re-created by cordova build)
Readme-Repositories (this file)

SVN right now contains the cordova version, so these are also committed:
config.xml    (this file is framework specific, differs between cordova and phonegap)
package.json  (this file is always re-created by cordova build)



[ GIT ]

GIT Manager ist generell die commandline app
Für Windows von https://git-scm.com/download/win

Ordner dito-m-anliegen = origin master (~root)

Aktivierte Ordner und Dateien:

www
hooks
.gitignore
Readme-Repositories (this file)
# Just for reference, since this file is always re-created by cordova build:
config-{cordova,phonegap}.xml
package-{cordova,phonegap}.json  

Explicitely ignored:

config.xml    (this file is framework specific, differs between cordova and phonegap)
package.json  (this file is always re-created by cordova build)




GIT COMMANDS:

git add origin https://github.com/{user-name}/{project-name}.git	........... Repository hinzufügen

git remote -v ....................... Remote reopistory anzeigen

git add (liste Ordner Dateien) ............ Changes zur 'queue'(stage) hinzufügen. Es wird noch kein commit ausgeführt !

git log	................................... GIT commit log anzeigen 

git add www/\* ............ Um einen Ordner 'www' mit allen Inhalten rekursiv zum Repo hinzuzufügen (oder in einem Unterordner: git add --all)

git commit -m "message"	........ commit step 1, wird lokal gespeichert

gut push origin master	........ commit step 2, hochladen

git pulll origin master	........ lokales repo vom server updaten (team update)


Wenn es Probleme gibt, in die Hilfen zu folgenden Kommandos hereinschauen:

git clean -n -f

git fetch origin

git fetch --prune

git reset -A

git reset --hard origin/master ...........................  Force 'pull', overwrite local files

git push --force --set-upstream origin master ............. Erzwungenes Überschreiben des remote repositories mit den lokalen commits (alle Konflikte werden ignoriert)



