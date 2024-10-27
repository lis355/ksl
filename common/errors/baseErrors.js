export const errors = {
	"UNKNOWN_FAIL": error => ["Неизвестная ошибка", error.data && error.data.message].filter(Boolean).join(" "),
	"NOT_IMPLEMENTED": "Логика не реализована",
	"LOGIC_ERROR": error => ["Логическая ошибка в коде", error.data && error.data.message].filter(Boolean).join(" "),
	"DEPRECATED": "Устаревший код",

	"DEBUG_ERROR": "Специальная ошибка для отладки",

	"NETWORK_ERROR": "Сетевая ошибка",

	"TIME_SYNC_FAILED": "Не получилось синхронизировать время"
};

export const BASE_ERRORS = new ndapp.enum(Object.keys(errors));
