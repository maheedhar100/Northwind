package com.details.employee;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import java.time.LocalDate;

@Entity   // Tells JPA: this class maps to a database table named "employee"
public class Employee {

    @Id   // Marks this field as the primary key (unique identifier for each row)
    @GeneratedValue(strategy = GenerationType.IDENTITY)   // DB auto-generates the id (1, 2, 3...)
    private Long id;

    private String name;
    private String email;
    private String department;
    private String role;
    private String location;
    private LocalDate hireDate;
    private double salary;
    @Column(columnDefinition = "boolean default true")
    private boolean active = true;

    // ----- Constructors -----

    // JPA REQUIRES a no-argument constructor (it uses this internally)
    public Employee() {
    }

    // Convenience constructor for creating Employee objects in code
    public Employee(String name, String email, String department, double salary) {
        this.name = name;
        this.email = email;
        this.department = department;
        this.salary = salary;
    }

    // ----- Getters and Setters -----
    // Spring uses these to convert between JSON and Java objects

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public LocalDate getHireDate() {
        return hireDate;
    }

    public void setHireDate(LocalDate hireDate) {
        this.hireDate = hireDate;
    }

    public double getSalary() {
        return salary;
    }

    public void setSalary(double salary) {
        this.salary = salary;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}