# frozen_string_literal: true

module Api
  module V1
    module Auth
      class LogoutController < ApplicationController
        def destroy
          reset_session
          render json: { message: 'Logout successful' }, status: :ok
        end
      end
    end
  end
end
