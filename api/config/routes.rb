Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      resources :workspaces, only: %i[index show create update destroy]
      resources :workspaces, only: [] do
        resources :epics, only: %i[index create]
        resources :issues, only: %i[index create]
        resources :sprints, only: %i[index create]
      end
      resources :epics, only: %i[show update destroy]
      resources :issues, only: %i[show update destroy]
      resources :sprints, only: %i[show update destroy]

      namespace :auth do
        post 'register', to: 'registration#create'
        post 'login', to: 'login#create'
        get 'me', to: 'me#show'
        delete 'logout', to: 'logout#destroy'
      end
    end
  end

end
