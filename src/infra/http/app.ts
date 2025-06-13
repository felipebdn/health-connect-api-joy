import { fastify, type FastifyReply, type FastifyRequest } from 'fastify'
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
import { GetProviderRouter } from './routes/provider/get-provider'
import { VerifyCodeRouter } from './routes/auth/verify-code'
import { NewPasswordRouter } from './routes/provider/new-password'
import { RegisterProviderRouter } from './routes/provider/register-provider'
import { UpdateProviderRouter } from './routes/provider/update-provider'
import { RegisterInstitutionRouter } from './routes/institution/register-institution'
import { RegisterPatientRouter } from './routes/patient/register-patient'
import { GetUserRouter } from './routes/auth/get-user'
import { ForgetPasswordRouter } from './routes/auth/forget-password'
import { EditEventRouter } from './routes/event/edit-event'
import { ListAvailabilityDayRouter } from './routes/event/list-availability-day'
import { ListAvailabilityByMonthRouter } from './routes/event/list-availability-month'
import { ListEventsProviderRouter } from './routes/event/list-events-provider'
import { NewEventRouter } from './routes/event/new-event'
import { GetAppointmentRouter } from './routes/appointment/get-appointment'
import { MakeAppointmentRouter } from './routes/appointment/make-appointment'
import fastifyCookie from '@fastify/cookie'
import { ListAppointmentsRouter } from './routes/appointment/list-appointment-day'
import { LogoutRoute } from './routes/auth/logout'
import { listProviders } from './routes/provider/list-providers'
import { NewRatingRouter } from './routes/rating/make-rating'
import { RegisterAddressRouter } from './routes/address/register-address'
import { GetAddressRouter } from './routes/via-cep/get-address'
import { UpdateAddressRouter } from './routes/address/update-address'
import { listProvidersByInstitution } from './routes/institution/list-providers-by-institution'
import { ListAffiliationRouter } from './routes/affiliation/list-affiliation'
import { EditAffiliationRouter } from './routes/affiliation/edit-affiliation'
import { DeleteAffiliationRouter } from './routes/affiliation/delete-affiliation'
import { listAvailabilitiesByInstitution } from './routes/institution/list-availabilities-by-institution'
import { SendInvitationProviderRouter } from './routes/affiliation/send-invitation-provider'
import { AffiliationConfirmingRouter } from './routes/affiliation/affiliation-confirming'
import { RevokeAffiliationRouter } from './routes/affiliation/revoke-affiliation'
import { GetInstitutionRouter } from './routes/institution/get-institution'

export async function bootstrap() {
  const app = fastify().withTypeProvider<ZodTypeProvider>()
  // const app = fastify({ logger: true }).withTypeProvider<ZodTypeProvider>()

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

  app.register(fastifyJwt, {
    secret: env.JWT_SECRET_KEY,
    cookie: {
      cookieName: 'atlas.access_token',
      signed: false,
    },
  })

  app.register(fastifyCookie)

  app.decorate(
    'authenticate',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const token = request.cookies['atlas.access_token']

      if (!token) {
        reply.status(401).send({ message: 'Unauthorized' })
      } else {
        try {
          await request.jwtVerify()
        } catch (err) {
          reply.status(401).send({ message: 'Unauthorized' })
        }
      }
    }
  )

  // auth
  app.register(AuthenticateRouter)
  app.register(GetUserRouter)
  app.register(ForgetPasswordRouter)
  app.register(VerifyCodeRouter)
  app.register(LogoutRoute)

  // event
  app.register(DeleteEventRouter)
  app.register(EditEventRouter)
  app.register(ListAvailabilityDayRouter)
  app.register(ListAvailabilityByMonthRouter)
  app.register(ListEventsProviderRouter)
  app.register(NewEventRouter)

  // provider
  app.register(ChangeDurationRouter)
  app.register(GetProviderRouter)
  app.register(NewPasswordRouter)
  app.register(RegisterProviderRouter)
  app.register(UpdateProviderRouter)
  app.register(listProviders)

  // appointment
  app.register(GetAppointmentRouter)
  app.register(MakeAppointmentRouter)
  app.register(ListAppointmentsRouter)

  // institution
  app.register(RegisterInstitutionRouter)
  app.register(listProvidersByInstitution)
  app.register(listAvailabilitiesByInstitution)
  app.register(SendInvitationProviderRouter)
  app.register(GetInstitutionRouter)

  // patient
  app.register(RegisterPatientRouter)

  // Rating
  app.register(NewRatingRouter)

  // Address
  app.register(RegisterAddressRouter)
  app.register(UpdateAddressRouter)

  // Affiliation
  app.register(AffiliationConfirmingRouter)
  app.register(ListAffiliationRouter)
  app.register(EditAffiliationRouter)
  app.register(RevokeAffiliationRouter)

  // Via cep
  app.register(GetAddressRouter)

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
