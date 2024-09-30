"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const { User } = require('../models/index.js');
class UserRepositry {
    // correct type by interface 
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield User.create(data);
                return user;
            }
            catch (error) {
                console.log(`Error at user repo level!!`);
            }
        });
    }
    destory(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield User.destory({
                    where: {
                        id: userId
                    }
                });
                return true;
            }
            catch (error) {
                console.log(`Error at user repo destroy level!!`);
            }
        });
    }
}
exports.default = UserRepositry;
