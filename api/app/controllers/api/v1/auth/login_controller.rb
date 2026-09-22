# frozen_string_literal: true

module Api
  module V1
    module Auth
      class LoginController < ApplicationController
        def create
          user = User.find_by(email: params[:email])

          if user&.authenticate(params[:password])
            session[:user_id] = user.id
            render json: { message: 'Login successful' }, status: :ok
          else
            render json: { error: 'Invalid email or password' }, status: :unauthorized
          end
        end
      end
    end
  end
end
