package com.details.employee;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;

    public EmployeeService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    // GET all active employees
    public List<Employee> getAllEmployees() {
        return employeeRepository.findByActiveTrue();
    }

    // GET one employee by id
    public Employee getEmployeeById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new EmployeeNotFoundException(id));
    }

    // CREATE a new employee
    public Employee createEmployee(Employee employee) {
        return employeeRepository.save(employee);
    }

    // UPDATE an existing employee
    public Employee updateEmployee(Long id, Employee updatedEmployee) {
        Employee existing = employeeRepository.findById(id)
                .orElseThrow(() -> new EmployeeNotFoundException(id));
        existing.setName(updatedEmployee.getName());
        existing.setEmail(updatedEmployee.getEmail());
        existing.setDepartment(updatedEmployee.getDepartment());
        existing.setRole(updatedEmployee.getRole());
        existing.setLocation(updatedEmployee.getLocation());
        existing.setHireDate(updatedEmployee.getHireDate());
        existing.setSalary(updatedEmployee.getSalary());
        existing.setActive(updatedEmployee.isActive());
        return employeeRepository.save(existing);
    }

    // SOFT DELETE — marks employee inactive instead of removing the row
    public void softDelete(Long id) {
        Employee existing = employeeRepository.findById(id)
                .orElseThrow(() -> new EmployeeNotFoundException(id));
        existing.setActive(false);
        employeeRepository.save(existing);
    }

    // DELETE an employee by id
    public void deleteEmployee(Long id) {
        if (!employeeRepository.existsById(id)) {
            throw new EmployeeNotFoundException(id);
        }
        employeeRepository.deleteById(id);
    }

    // GET employees by department
    public List<Employee> getEmployeesByDepartment(String department) {
        return employeeRepository.findByDepartment(department);
    }

    // SEARCH employees whose name contains the given string (case-insensitive)
    public List<Employee> searchEmployeesByName(String name) {
        return employeeRepository.findByNameContainingIgnoreCase(name);
    }

    // GET employees with salary between min and max
    public List<Employee> getEmployeesBySalaryRange(double min, double max) {
        return employeeRepository.findBySalaryBetween(min, max);
    }

    // GET paged and sorted employees
    public Page<Employee> getPaged(Pageable pageable) {
        return employeeRepository.findAll(pageable);
    }

    // COUNT total employees
    public long getCount() {
        return employeeRepository.count();
    }

    // AVERAGE salary across all employees (0.0 if no employees)
    public double getAverageSalary() {
        return employeeRepository.findAll().stream()
                .mapToDouble(Employee::getSalary)
                .average()
                .orElse(0.0);
    }

    // COUNT employees grouped by department
    public Map<String, Long> getCountByDepartment() {
        return employeeRepository.findAll().stream()
                .collect(Collectors.groupingBy(Employee::getDepartment, Collectors.counting()));
    }
}