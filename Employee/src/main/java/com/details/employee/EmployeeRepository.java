package com.details.employee;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    List<Employee> findByActiveTrue();

    List<Employee> findByDepartmentIgnoreCase(String department);

    List<Employee> findByNameContainingIgnoreCase(String name);

    List<Employee> findBySalaryBetween(double min, double max);

    List<Employee> findBySalaryGreaterThanOrderBySalaryDesc(double salary);
}
























































