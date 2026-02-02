# DentMetric

Vue 3 + Vite + Konva. Приложение для оценки вмятин на кузове авто.

## Как задеплоить

1. `npm ci`
2. `npm run deploy:setup` — один раз (проверяет origin, создаёт ветку gh-pages при необходимости)
3. `npm run deploy` — каждый раз (сборка + пуш dist в gh-pages)

**Важно:** В GitHub → Settings → Pages выберите **Source: Deploy from a branch**, **Branch: gh-pages** с корнем `/ (root)`.
