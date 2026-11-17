package com.spendwise.api.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(ResponseStatusException.class)
    ResponseEntity<Map<String,String>> status(ResponseStatusException exception){
        return ResponseEntity.status(exception.getStatusCode()).body(Map.of("error",exception.getReason()==null?"Request failed":exception.getReason()));
    }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<Map<String,String>> validation(MethodArgumentNotValidException exception){
        String message=exception.getBindingResult().getFieldErrors().stream().findFirst().map(e->e.getField()+" "+e.getDefaultMessage()).orElse("Request validation failed");
        return ResponseEntity.badRequest().body(Map.of("error",message));
    }
    @ExceptionHandler(Exception.class)
    ResponseEntity<Map<String,String>> unexpected(Exception exception){return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error","An unexpected server error occurred"));}
}
