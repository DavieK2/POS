import db from "@adonisjs/lucid/services/db";
import User from "../models/user.js";
import UserType from "../enums/user_types.js";

export default class UserService {

    static async findClosestSP( params: { lat: number, long: number, radius?: number, serviceId: string } ) {
       
    
        let query = User.query()
                        .join('user_services', 'user_services.user_id', 'users.id')
                        .where('users.user_type', UserType.ServiceProvider)
                        .where('users.is_approved', true)
                        .where('users.is_available', true)
                        .where('user_services.service_id', params.serviceId)
                        .select(
                            'users.id',
                            'users.full_name',
                            'users.email',
                            'users.latitude',
                            'users.longitude',
                            db.raw(`
                                ST_Distance(
                                    users.geog,
                                    ST_SetSRID(ST_MakePoint(:long, :lat), 4326)::geography
                                ) AS distance_meters`,{
                                    long: params.long,
                                    lat: params.lat
                                }
                            )
                        )
                        .orderBy('distance_meters', 'asc') 
                        .limit(5)
    
      
        if( params.radius ) {

            const radiusMeters = params.radius * 1000;

            query = query.whereRaw(
                'ST_DWithin(users.geog, ST_SetSRID(ST_MakePoint(:long, :lat), 4326)::geography, :radius)',
                {
                    long: params.long,
                    lat: params.lat,
                    radius: radiusMeters
                }
            )
        }
    
       
        return await query;
    
    }



    static async findClosestSPFilterUsers( params: { lat: number, long: number, radius?: number, filteredUsers: string[], serviceId: string  } ) {
       
        let query = User.query()
                        .join('user_services', 'user_services.user_id', 'users.id')
                        .where('users.user_type', UserType.ServiceProvider)
                        .where('users.is_approved', true)
                        .where('users.is_available', true)
                        .where('user_services.service_id', params.serviceId)
                        .whereNotIn('users.id', params.filteredUsers)
                        .select(
                            'users.id',
                            'users.full_name',
                            'users.email',
                            'users.latitude',
                            'users.longitude',
                            db.raw(`
                                ST_Distance(
                                    users.geog,
                                    ST_SetSRID(ST_MakePoint(:long, :lat), 4326)::geography
                                ) AS distance_meters`,{
                                    long: params.long,
                                    lat: params.lat
                                }
                            )
                        )
                        .orderBy('distance_meters', 'asc') 
                        .limit(5)
    
      
        if ( params.radius ) {

            const radiusMeters = params.radius * 1000;
         
            query = query.whereRaw(
                'ST_DWithin(users.geog, ST_SetSRID(ST_MakePoint(:long, :lat), 4326)::geography, :radius)',
                {
                    long: params.long,
                    lat: params.lat,
                    radius: radiusMeters
                }
            )
        }
    
       
        return await query;
    
    }
}