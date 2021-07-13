export interface PaginatedResult<T> {
	count: number;
	rows: T[];
}
