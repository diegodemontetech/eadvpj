import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../../store/useAuthStore';
import { Upload, Save } from 'lucide-react';

const departments = [
  'Administrativo',
  'Comercial',
  'Controladoria',
  'Financeiro',
  'Logística',
  'Marketing',
  'Operações',
  'Pecuária',
  'Produção',
  'Qualidade',
  'Recursos Humanos',
  'Tecnologia da Informação',
] as const;

const positions = {
  Administrativo: [
    'Analista Administrativo',
    'Assistente Administrativo',
    'Coordenador Administrativo',
    'Gerente Administrativo',
    'Secretária Executiva'
  ],
  Comercial: [
    'Analista Comercial',
    'Assistente Comercial',
    'Coordenador Comercial',
    'Executivo de Contas',
    'Gerente Comercial',
    'Representante Comercial',
    'Supervisor de Vendas',
    'Vendedor'
  ],
  Controladoria: [
    'Analista Contábil',
    'Analista de Controladoria',
    'Contador',
    'Controller',
    'Coordenador de Controladoria',
    'Gerente de Controladoria'
  ],
  Financeiro: [
    'Analista Financeiro',
    'Assistente Financeiro',
    'Coordenador Financeiro',
    'Gerente Financeiro',
    'Tesoureiro'
  ],
  Logística: [
    'Analista de Logística',
    'Assistente de Logística',
    'Coordenador de Logística',
    'Gerente de Logística',
    'Supervisor de Expedição',
    'Supervisor de Transporte'
  ],
  Marketing: [
    'Analista de Marketing',
    'Assistente de Marketing',
    'Coordenador de Marketing',
    'Gerente de Marketing',
    'Social Media'
  ],
  Operações: [
    'Analista de Operações',
    'Coordenador de Operações',
    'Gerente de Operações',
    'Supervisor de Operações'
  ],
  Pecuária: [
    'Analista Pecuário',
    'Coordenador Pecuário',
    'Gerente Pecuário',
    'Médico Veterinário',
    'Supervisor de Campo',
    'Técnico em Agropecuária',
    'Zootecnista'
  ],
  Produção: [
    'Analista de Produção',
    'Auxiliar de Produção',
    'Coordenador de Produção',
    'Encarregado de Produção',
    'Gerente de Produção',
    'Operador de Máquinas',
    'Supervisor de Produção',
    'Técnico de Manutenção'
  ],
  Qualidade: [
    'Analista da Qualidade',
    'Assistente da Qualidade',
    'Auditor da Qualidade',
    'Coordenador da Qualidade',
    'Gerente da Qualidade',
    'Supervisor da Qualidade',
    'Técnico da Qualidade'
  ],
  'Recursos Humanos': [
    'Analista de RH',
    'Assistente de RH',
    'Coordenador de RH',
    'Gerente de RH',
    'Supervisor de RH'
  ],
  'Tecnologia da Informação': [
    'Analista de Sistemas',
    'Analista de Suporte',
    'Coordenador de TI',
    'Desenvolvedor',
    'Gerente de TI',
    'Técnico de Suporte'
  ]
} as const;

const userSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  department: z.enum(departments),
  position: z.string(),
  company: z.string().optional(),
  bio: z.string().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

export const UserSettings = () => {
  const { user, updateUser } = useAuthStore();
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(
    user?.avatar || null
  );
  const [selectedDepartment, setSelectedDepartment] = React.useState<keyof typeof positions>(
    user?.department || departments[0]
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      department: user?.department || departments[0],
      position: user?.position || '',
      company: user?.company || '',
      bio: user?.bio || '',
    },
  });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      // Here you would typically upload the file to your server
    }
  };

  const onSubmit = async (data: UserFormData) => {
    try {
      await updateUser(data);
      // Show success message
    } catch (error) {
      // Show error message
    }
  };

  // Watch department changes to update position options
  React.useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'department') {
        setSelectedDepartment(value.department as keyof typeof positions);
        setValue('position', ''); // Reset position when department changes
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">
          Informações Pessoais
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex items-center space-x-6">
            <div className="relative">
              <img
                src={avatarPreview || 'https://via.placeholder.com/150'}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover"
              />
              <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer">
                <Upload className="w-4 h-4 text-gray-600" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>
            <div>
              <h3 className="text-gray-900 font-medium">{user?.name}</h3>
              <p className="text-gray-500 text-sm">{user?.email}</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 gap-6 mt-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nome Completo
              </label>
              <input
                type="text"
                {...register('name')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                {...register('email')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Telefone
              </label>
              <input
                type="tel"
                {...register('phone')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Empresa
              </label>
              <input
                type="text"
                {...register('company')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Departamento
              </label>
              <select
                {...register('department')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cargo
              </label>
              <select
                {...register('position')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Selecione um cargo</option>
                {positions[selectedDepartment].map((pos) => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Biografia
            </label>
            <textarea
              {...register('bio')}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Conte um pouco sobre você..."
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};