# frozen_string_literal: true

module Api
  module V1
    module Auth
      class MeController < ApplicationController
        before_action :authenticate_user!

        def show
          render json: {
            user: {
              id: current_user.id,
              name: current_user.name,
              email: current_user.email
            }
          }, status: :ok
        end
      end
    end
  end
end
