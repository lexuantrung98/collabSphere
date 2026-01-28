using System.Net;
using System.Text.Json;
using CourseService.Wrappers;

namespace CourseService.Middlewares
{
    public class GlobalExceptionMiddleware
    {
        private readonly RequestDelegate _next;

        public GlobalExceptionMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(HttpContext context)
        {
            try
            {
                // Cho request đi tiếp
                await _next(context);
            }
            catch (Exception error)
            {
                // Nếu có lỗi ở bất cứ đâu, nó sẽ nhảy vào đây
                await HandleExceptionAsync(context, error);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

            // Tạo response chuẩn format
            var response = new ApiResponse<string>(false, "Lỗi hệ thống không mong muốn", new List<string> { exception.Message });

            var json = JsonSerializer.Serialize(response);
            return context.Response.WriteAsync(json);
        }
    }
}