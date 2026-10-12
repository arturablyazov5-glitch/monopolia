#!/bin/zsh
# Чистка временного мусора агентов. Режим по умолчанию — показать (dry-run); удалить: --apply
# Что чистит:
#  1) /private/tmp/claude-501/<имя>: сборки и снимки старше 3 часов (кроме tools, codex, npm-cache, каталогов сессий -Users-*);
#  2) корень проекта: *.png/*.jpg, которых нет в git, старше 60 минут.
# Ничего другого не трогает: исходники, design-reference, public, node_modules остаются.
APPLY=0; [ "$1" = "--apply" ] && APPLY=1
TMP=/private/tmp/claude-501
PROJECT="/Users/rafael/Documents/Работа/Проекты/Монополия"
act() { if [ $APPLY -eq 1 ]; then rm -rf -- "$1"; echo "удалено: $1"; else echo "удалил бы: $1"; fi }
if [ -d "$TMP" ]; then
  for d in "$TMP"/*(N/); do
    name=${d:t}
    case "$name" in tools|codex|npm-cache|bash-edit-diff|-*) continue;; esac
    [ -n "$(find "$d" -mmin -180 -print -quit 2>/dev/null)" ] && continue
    act "$d"
  done
fi
if [ -d "$PROJECT/.git" ]; then
  for f in "$PROJECT"/*.png(N) "$PROJECT"/*.jpg(N); do
    [ -f "$f" ] || continue
    git -C "$PROJECT" ls-files --error-unmatch -- "${f:t}" >/dev/null 2>&1 && continue
    [ -n "$(find "$f" -mmin -60 -print -quit)" ] && continue
    act "$f"
  done
fi
df -h / | tail -1 | awk '{print "свободно на диске:", $4}'
