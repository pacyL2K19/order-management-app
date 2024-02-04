"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIResponse = void 0;
var APIResponse = /** @class */ (function () {
    function APIResponse(success, message, data) {
        if (data === void 0) { data = null; }
        this.success = success;
        this.message = message;
        this.error = null;
        this.data = data;
    }
    APIResponse.success = function (data, message) {
        if (message === void 0) { message = "Success"; }
        return new APIResponse(true, message, data);
    };
    APIResponse.error = function (message) {
        return new APIResponse(false, message);
    };
    APIResponse.prototype.toJSON = function () {
        return {
            success: this.success,
            message: this.message,
            data: this.data,
        };
    };
    return APIResponse;
}());
exports.APIResponse = APIResponse;
