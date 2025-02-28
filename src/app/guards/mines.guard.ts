import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { UserService } from '../services/user.service';

export const minesGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  return userService.isConnect();
};
