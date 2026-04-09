import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { randomBytes, scrypt as _scrypt } from "crypto";
import { promisify } from "util";
import { UsersService } from "./users.service";
import { NotFoundError } from "rxjs";

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private userService: UsersService){}

  async signup(email: string, password: string){

    // check if the user email already exists
    const existingUser = await this.userService.find(email);

    // if the user email already exists, throw an error
    if (existingUser.length > 0) {
      throw new BadRequestException('User email already exists');
    }
    
    //Hash the user password
    // Generate a salt
    const salt = randomBytes(8).toString('hex');

    //  Hash the salt and the paswword together
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    // Join the hashed result and the salt togehter
    const result = salt + '.' + hash.toString('hex');

    // Create a new user and save 
    const user = await this.userService.create(email, result);

    // return the user
    return user
  }

  async signin (email: string, password: string){

    const [user] = await this.userService.find(email);

    if(!user){
      throw new NotFoundException("User not found");
    }

    const [salt, storedHash] = user.password.split('.');

    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (storedHash !== hash.toString('hex')) {
      throw new BadRequestException('Invalid password');
    }

    return user;

  }
  
}