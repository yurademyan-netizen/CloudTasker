# Етап 1: Збірка
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Копіюємо файл проєкту
COPY ["CloudTasker.API.csproj", "./"]
# Завантажуємо бібліотеки
RUN dotnet restore "CloudTasker.API.csproj"

# Копіюємо весь код і збираємо
COPY . .
RUN dotnet publish "CloudTasker.API.csproj" -c Release -o /app/publish

# Етап 2: Запуск
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Налаштовуємо порт 8080 для прослуховування
ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "CloudTasker.API.dll"]