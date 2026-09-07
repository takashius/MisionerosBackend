import { UserResponse } from "../types/users";

export function toUserResponse(user: any): UserResponse {
  return {
    _id: user._id.toString(),
    name: user.name,
    lastName: user.lastName,
    phone: user.phone,
    photo: user.photo,
    banner: user.banner,
    date: user.date,
    email: user.email,
    role: user.role,
    bio: user.bio,
    address: user.address,
    active: user.active,
  };
}
