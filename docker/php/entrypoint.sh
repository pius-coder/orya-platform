#!/bin/sh
set -e

# A unique APP_KEY is generated once and shared across the php/queue/scheduler
# containers via a named volume, so cookies/sessions stay decryptable everywhere
# without baking a secret into the image or the compose file.
APP_KEY_FILE=/var/appkey/app_key

if [ "$1" = "php-fpm" ]; then
    if [ ! -s "$APP_KEY_FILE" ]; then
        echo "[entrypoint] generating APP_KEY..."
        php artisan key:generate --show > "$APP_KEY_FILE"
    fi
fi

echo "[entrypoint] waiting for APP_KEY..."
while [ ! -s "$APP_KEY_FILE" ]; do sleep 1; done
APP_KEY="$(cat "$APP_KEY_FILE")"
export APP_KEY

echo "[entrypoint] waiting for database ${DB_HOST}:${DB_PORT:-3306}..."
until php -r 'exit(@fsockopen(getenv("DB_HOST"), (int) (getenv("DB_PORT") ?: 3306)) ? 0 : 1);'; do
    sleep 2
done

# Only the api (php-fpm) container runs migrations + builds the prod caches;
# workers just consume the same database.
if [ "$1" = "php-fpm" ]; then
    echo "[entrypoint] migrating + caching..."
    php artisan migrate --force
    php artisan config:cache
    php artisan route:cache
    php artisan event:cache
fi

exec "$@"
