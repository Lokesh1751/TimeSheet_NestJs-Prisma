export const API_BASE_URL = 'http://localhost:3000';

export const api = {
  timesheet: {
    create: `${API_BASE_URL}/timesheet`,
    getByYear: (year: number) => `${API_BASE_URL}/timesheet/${year}`,
    bulkUpdate: `${API_BASE_URL}/timesheet/bulk-update`,
  }
}; 