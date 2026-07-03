using System;

namespace Vector.Api.Models.Common
{
    public class Result<T>
    {
        public int Code { get; set; }
        public T? Data { get; set; }
        public bool Error { get; set; }
        public string Message { get; set; } = string.Empty;

        public static Result<T> Success(T data, string message = "Success", int code = 200)
        {
            return new Result<T>
            {
                Code = code,
                Data = data,
                Error = false,
                Message = message
            };
        }

        public static Result<T> Failure(string message, int code = 400)
        {
            return new Result<T>
            {
                Code = code,
                Data = default,
                Error = true,
                Message = message
            };
        }
    }

    public class Result
    {
        public int Code { get; set; }
        public object? Data { get; set; }
        public bool Error { get; set; }
        public string Message { get; set; } = string.Empty;

        public static Result Success(string message = "Success", int code = 200, object? data = null)
        {
            return new Result
            {
                Code = code,
                Data = data,
                Error = false,
                Message = message
            };
        }

        public static Result Failure(string message, int code = 400)
        {
            return new Result
            {
                Code = code,
                Data = null,
                Error = true,
                Message = message
            };
        }
    }
}
