namespace CourseService.Wrappers
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }
        public List<string>? Errors { get; set; }

        // Constructor cho trường hợp Thành công
        public ApiResponse(T data, string message = "Success")
        {
            Success = true;
            Message = message;
            Data = data;
            Errors = null;
        }

        // Constructor cho trường hợp Thất bại
        public ApiResponse(bool success, string message, List<string>? errors = null)
        {
            Success = success;
            Message = message;
            Data = default;
            Errors = errors;
        }
    }
}