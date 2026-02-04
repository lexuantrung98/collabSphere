# ============================================
# CommunicationService Dockerfile
# Multi-stage build for .NET 8
# ============================================

# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0-alpine AS build
WORKDIR /src

# Copy csproj first for better layer caching
COPY Communication_Service/*.csproj ./Communication_Service/
RUN dotnet restore Communication_Service/CommunicationService.csproj

# Copy source code and build
COPY Communication_Service/. ./Communication_Service/
WORKDIR /src/Communication_Service

# Restore again to ensure all packages are available, then publish
RUN dotnet restore && dotnet publish -c Release -o /app/publish

# ============================================
# Runtime stage - minimal image
# ============================================
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine AS final

# Install curl for health checks and icu-libs for globalization
RUN apk add --no-cache curl icu-libs

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy published files
COPY --from=build /app/publish .

# Copy Firebase credentials
COPY Communication_Service/firebase-admin-sdk.json ./


# Change ownership to non-root user
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 5015

# Environment variables
ENV ASPNETCORE_URLS=http://+:5015 \
    ASPNETCORE_ENVIRONMENT=Production \
    DOTNET_RUNNING_IN_CONTAINER=true

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:5015/health || exit 1

# Entry point
ENTRYPOINT ["dotnet", "CommunicationService.dll"]
