package com.details.employee;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController                          // This class handles web requests & returns JSON
@RequestMapping("/api/employees")        // All endpoints here start with /api/employees
public class EmployeeController {

    private final EmployeeService employeeService;

    // Constructor injection — Spring passes in the service
    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    // GET  /api/employees  → get all employees
    @GetMapping
    public List<Employee> getAllEmployees() {
        return employeeService.getAllEmployees();
    }

    // GET  /api/employees/1  → get one employee by id
    @GetMapping("/{id}")
    public Employee getEmployeeById(@PathVariable Long id) {
        return employeeService.getEmployeeById(id);
    }

    // POST  /api/employees  → create a new employee
    @PostMapping
    public Employee createEmployee(@RequestBody Employee employee) {
        return employeeService.createEmployee(employee);
    }

    // PUT  /api/employees/1  → update an employee
    @PutMapping("/{id}")
    public Employee updateEmployee(@PathVariable Long id, @RequestBody Employee employee) {
        return employeeService.updateEmployee(id, employee);
    }

    // PATCH  /api/employees/1/deactivate  → soft delete (marks inactive)
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivateEmployee(@PathVariable Long id) {
        employeeService.softDelete(id);
        return ResponseEntity.noContent().build();
    }

    // DELETE  /api/employees/1  → hard delete an employee
    @DeleteMapping("/{id}")
    public void deleteEmployee(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
    }

    // GET  /api/employees/department/Engineering  → get employees by department
    @GetMapping("/department/{department}")
    public List<Employee> getByDepartment(@PathVariable String department) {
        return employeeService.getEmployeesByDepartment(department);
    }

    // GET  /api/employees/search?name=john  → search employees by name
    @GetMapping("/search")
    public List<Employee> searchByName(@RequestParam String name) {
        return employeeService.searchEmployeesByName(name);
    }

    // GET  /api/employees/salary-range?min=50000&max=100000  → filter by salary range
    @GetMapping("/salary-range")
    public List<Employee> getBySalaryRange(@RequestParam double min, @RequestParam double max) {
        return employeeService.getEmployeesBySalaryRange(min, max);
    }

    // GET  /api/employees/paged?page=0&size=10&sortBy=name&sortDir=asc  → paginated and sorted employees
    @GetMapping("/paged")
    public Page<Employee> getPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        return employeeService.getPaged(PageRequest.of(page, size, sort));
    }

    // GET  /api/employees/count  → total number of employees
    @GetMapping("/count")
    public long getCount() {
        return employeeService.getCount();
    }

    // GET  /api/employees/stats/average-salary  → average salary
    @GetMapping("/stats/average-salary")
    public double getAverageSalary() {
        return employeeService.getAverageSalary();
    }

    // GET  /api/employees/stats/by-department  → employee count per department
    @GetMapping("/stats/by-department")
    public Map<String, Long> getCountByDepartment() {
        return employeeService.getCountByDepartment();
    }
}