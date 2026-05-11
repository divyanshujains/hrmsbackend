class ApiResponse {
  constructor(success, message, data = null) {
    this.success = success;
    this.message = message;
    if (data) {
      this.data = data;
    }
  }
}

module.exports = ApiResponse;
