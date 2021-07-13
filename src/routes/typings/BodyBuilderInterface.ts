// Parts
export interface CollectionBody {
	rows: any[];
	count: number;
}
export interface ErrorItem {
	location?: string;
	param?: string;
	msg: string;
}

// Full Body
export interface OkResponse {
	status?: boolean;
	data: CollectionBody | any;
}
export interface ErrorResponse {
	errors: ErrorItem[];
}
