package io.storyspace.service;
import io.storyspace.accounts.*;import org.springframework.security.core.context.SecurityContextHolder;import org.springframework.stereotype.Component;
@Component public class CurrentAccount {
 private final AccountRepository repo;public CurrentAccount(AccountRepository repo){this.repo=repo;}
 public Account require(){String email=SecurityContextHolder.getContext().getAuthentication().getName();return repo.findByEmailIgnoreCase(email).orElseThrow();}
}