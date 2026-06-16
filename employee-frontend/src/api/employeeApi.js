import axios from 'axios';

const http = axios.create();

// ── Shape adapters ────────────────────────────────────────────
// Backend uses `active: boolean`; frontend uses `status: "Active"|"Inactive".

function toFrontend(emp) {
  return {
    ...emp,
    status:   emp.active ? 'Active' : 'Inactive',
    role:     emp.role     ?? '',
    location: emp.location ?? '',
    hireDate: emp.hireDate ?? '',
  };
}

function toBackend(emp) {
  return {
    name:       emp.name,
    email:      emp.email,
    department: emp.department,
    role:       emp.role     || null,
    location:   emp.location || null,
    hireDate:   emp.hireDate || null,
    salary:     Number(emp.salary),
    active:     emp.status === 'Active',
  };
}

const mapList = (res) => ({ ...res, data: res.data.map(toFrontend) });
const mapOne  = (res) => ({ ...res, data: toFrontend(res.data) });

// ── Endpoints ─────────────────────────────────────────────────
export const getEmployees       = ()         => http.get('/api/employees').then(mapList);
export const getEmployeesPaged  = (params)   => http.get('/api/employees/paged', { params })
                                                    .then((res) => ({ ...res, data: { ...res.data, content: res.data.content.map(toFrontend) } }));
export const searchEmployees    = (name)     => http.get('/api/employees/search', { params: { name } }).then(mapList);
export const createEmployee     = (data)     => http.post('/api/employees', toBackend(data)).then(mapOne);
export const updateEmployee     = (id, data) => http.put(`/api/employees/${id}`, toBackend(data)).then(mapOne);
export const deleteEmployee     = (id)       => http.delete(`/api/employees/${id}`);
export const deactivateEmployee = (id)       => http.patch(`/api/employees/${id}/deactivate`);
export const getCount           = ()         => http.get('/api/employees/count');
export const getAverageSalary   = ()         => http.get('/api/employees/stats/average-salary');
export const getByDepartment    = ()         => http.get('/api/employees/stats/by-department');
