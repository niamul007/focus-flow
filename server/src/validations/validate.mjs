import {z } from 'zod'

export const validate = (schema) => (req,res,next) =>{
    const result = schema.safeParse({
        body: req.body,
        params: req.params,
        query: req.query
    })

    if(!result.success){
        return res.status(400).json({
            status: "error",
            errors: result.error.errors.map(err=>({
                field: err.path.join('.'),
                message: err.message
            }))
        })
    }

    req.body = result.data.body;
    req.params = result.data.params;
    req.query = result.data.query;
    next()

}

