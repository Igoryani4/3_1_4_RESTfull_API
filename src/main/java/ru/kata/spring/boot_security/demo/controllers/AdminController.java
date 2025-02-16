package ru.kata.spring.boot_security.demo.controllers;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import ru.kata.spring.boot_security.demo.models.Role;
import ru.kata.spring.boot_security.demo.models.User;
import ru.kata.spring.boot_security.demo.repository.RoleRepository;
import ru.kata.spring.boot_security.demo.repository.UserRepository;
import ru.kata.spring.boot_security.demo.service.CustomUserDetailService;

import java.util.List;
import java.util.Set;

@RestController()
@RequestMapping("/api")
public class AdminController {

    private final CustomUserDetailService customUserDetailService;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;


    public AdminController(CustomUserDetailService customUserDetailService, UserRepository userRepository,
                           PasswordEncoder passwordEncoder, RoleRepository roleRepository) {
        this.customUserDetailService = customUserDetailService;
        this.passwordEncoder = passwordEncoder;
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/admin")
    public ResponseEntity<Set<User>> findAll() {
        Set<User> list = customUserDetailService.findAll();
        return new ResponseEntity<>(list, HttpStatus.OK);
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<User> apiGetOneUser(@PathVariable("id") long id) {
        User user = userRepository.findById(id).orElse(null);
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    @GetMapping("/this_user")
    public ResponseEntity<User> apiGetOneUser() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder
                .getContext().getAuthentication().getPrincipal();
        User finduser = userRepository.findByUsernameOrEmail(userDetails
                .getUsername(), userDetails.getUsername()).get();
        User user = userRepository.findByUsername(userDetails.getUsername()).get();
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    @GetMapping("roles")
    public ResponseEntity<Set<Role>> apiGetAllRoles() {
        Set<Role> roles = (Set<Role>) roleRepository.findAll();
        return new ResponseEntity<>(roles, HttpStatus.OK);
    }


    @PostMapping ("/register")
    public ResponseEntity<HttpStatus> createUser(@RequestBody User user) {
        String hashedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(hashedPassword);
        customUserDetailService.saveUser(user);
        return new ResponseEntity<>(HttpStatus.OK);
    }



    @DeleteMapping("delete/{id}")
    public ResponseEntity<HttpStatus> apiDeleteUser(@PathVariable("id") long id) {
        customUserDetailService.delete(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }


    @PutMapping("/update")
    public ResponseEntity<HttpStatus> apiUpdateUser( @RequestBody User user) {
        customUserDetailService.update(user);
        return new ResponseEntity<>(HttpStatus.OK);
    }



}
