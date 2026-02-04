# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0-alpine AS build
WORKDIR /src

# Copy csproj and restore
COPY ApiGateway/*.csproj ./ApiGateway/
RUN dotnet restore ApiGateway/ApiGateway.csproj

# Copy source and build
COPY ApiGateway/. ./ApiGateway/
WORKDIR /src/ApiGateway
RUN dotnet restore && dotnet publish -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine AS final

# Install curl for healthcheck
RUN apk add --no-cache curl

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app
COPY --from=build /app/publish .

# Set ownership
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 5100

ENV ASPNETCORE_URLS=http://+:5100
ENV ASPNETCORE_ENVIRONMENT=Production

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5100/health || exit 1

ENTRYPOINT ["dotnet", "ApiGateway.dll"]
