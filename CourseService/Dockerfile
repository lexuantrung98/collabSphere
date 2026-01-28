# ============================================
# CourseService Dockerfile
# Multi-stage build for .NET 8
# ============================================

# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0-alpine AS build
WORKDIR /src

# Copy csproj first for better layer caching
COPY CourseService/*.csproj ./CourseService/
RUN dotnet restore CourseService/CourseService.csproj

# Copy source code and build
COPY CourseService/. ./CourseService/
WORKDIR /src/CourseService

# Restore again to ensure all packages are available, then publish
RUN dotnet restore && dotnet publish -c Release -o /app/publish

# ============================================
# Runtime stage - minimal image
# ============================================
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine AS final

# Install curl for health checks
RUN apk add --no-cache curl

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Create uploads directory
RUN mkdir -p /app/wwwroot/uploads && chown -R appuser:appgroup /app

# Copy published files
COPY --from=build /app/publish .

# Change ownership to non-root user
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 5021

# Environment variables
ENV ASPNETCORE_URLS=http://+:5021 \
    ASPNETCORE_ENVIRONMENT=Production \
    DOTNET_RUNNING_IN_CONTAINER=true \
    DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:5021/health || exit 1

# Entry point
ENTRYPOINT ["dotnet", "CourseService.dll"]
