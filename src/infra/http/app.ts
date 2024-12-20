import { fastify } from 'fastify'
import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import fastifySwagger from '@fastify/swagger'
import ScalarApiReference from '@scalar/fastify-api-reference'
import { env } from '@/env'
import { AuthenticateRouter } from './routes/auth/authenticate'
import { ChangeDurationRouter } from './routes/provider/change-duration'
import { DeleteEventRouter } from './routes/event/delete-event'
import { EditEventRouter } from './routes/event/edit-event'
import { GetAppointmentRouter } from './routes/appointment/get-appointment'
import { ForgetPasswordRouter } from './routes/auth/forget-password'
import { GetProviderRouter } from './routes/provider/get-provider'
import { ListAppointmentsRouter } from './routes/appointment/list-appointments'
import { MakeAppointmentRouter } from './routes/appointment/make-appointment'
import { VerifyCodeRouter } from './routes/auth/verify-code'
import { ListAvailabilityDayRouter } from './routes/event/list-availability-day'
import { ListAvailabilityByMonthRouter } from './routes/event/list-availability-month'
import { ListEventsProviderRouter } from './routes/event/list-events-provider'
import { NewEventRouter } from './routes/event/new-event'
import { NewPasswordRouter } from './routes/provider/new-password'
import { RegisterProviderRouter } from './routes/provider/register-provider'
import { UpdateProviderRouter } from './routes/provider/update-provider'

export async function bootstrap() {
  const app = fastify({ logger: true }).withTypeProvider<ZodTypeProvider>()

  app.setSerializerCompiler(serializerCompiler)
  app.setValidatorCompiler(validatorCompiler)

  app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Atlas',
        version: '1.0.0',
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      servers: [],
    },
    transform: jsonSchemaTransform,
  })

  app.get('/openapi.json', async () => {
    return app.swagger()
  })

  app.register(ScalarApiReference, {
    routePrefix: '/api',
    configuration: {
      spec: {
        url: '/openapi.json',
      },
    },
  })

  app.register(fastifyCors, {
    origin: true,
    credentials: true,
  })

  app.register(AuthenticateRouter)
  app.register(ForgetPasswordRouter)
  app.register(VerifyCodeRouter)

  app.register(DeleteEventRouter)
  app.register(EditEventRouter)
  app.register(ListAvailabilityDayRouter)
  app.register(ListAvailabilityByMonthRouter)
  app.register(ListEventsProviderRouter)
  app.register(NewEventRouter)

  app.register(ChangeDurationRouter)
  app.register(GetProviderRouter)
  app.register(NewPasswordRouter)
  app.register(RegisterProviderRouter)
  app.register(UpdateProviderRouter)

  app.register(GetAppointmentRouter)
  app.register(ListAppointmentsRouter)
  app.register(MakeAppointmentRouter)

  app.register(fastifyJwt, {
    secret: env.JWT_SECRET_KEY,
  })

  app.setErrorHandler((error, _, reply) => {
    if (env.NODE_ENV !== 'production') {
      console.error(error)
    } else {
      // TODO: Here we should log to a external tool like DataDog/NewRelic/Sentry
    }

    return reply.status(500).send({ message: 'Internal server error.' })
  })

  return app
}
